const { UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { class: className }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();

		const { access, class: studentOf, classTeacherOf } = await authenticate(authorization);
		if (access !== `Student` && !className)
			throw new UserInputError(`Insufficient data ⚠`, {
				error: `You must provide a class info to get timetable.`,
			});

		const node = client.db(dbName).collection(`timetable`);

		if (!classTeacherOf || !className)
			throw new UserInputError(`Insufficient data ⚠`, { error: `You must provide Class info. to get details of.` });

		const check = await node.findOne({ class: className });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the class you're trying to get timetable for.`,
			});

		const [timeTable] = await node
			.aggregate([
				{ $match: { class: studentOf || className || classTeacherOf } },
				{
					$lookup: {
						from: `teachers`,
						let: { teacher: { $toObjectId: `days.teacher` } },
						pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$teacher`] } } }],
						as: `teacher`,
					},
				},
				{
					$lookup: {
						from: `subject`,
						let: { subject: { $toObjectId: `days.subject` } },
						pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$subject`] } } }],
						as: `subject`,
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return timeTable;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { class: className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`timetables`);

		const check = await node.findOne({ class: className });
		if (check)
			throw new UserInputError(`Already saved ⚠`, {
				error: `Time Table already exists for provided class. Consider updating it.`,
			});

		const { insertedId } = await node.insertOne({
			class: className,
			days: data.filter((x) => x.from && x.to),
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [timeTable] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{
					$lookup: {
						from: `teachers`,
						let: { teacher: { $toObjectId: `days.teacher` } },
						pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$teacher`] } } }],
						as: `days.teacher`,
					},
				},
				{ $unwind: { path: `$days.teacher`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `subjects`,
						let: { subject: { $toObjectId: `days.subject` } },
						pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$subject`] } } }],
						as: `days.subject`,
					},
				},
				{ $unwind: { path: `$days.subject`, preserveNullAndEmptyArrays: true } },
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

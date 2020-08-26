const { UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { class: className, month, year }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { class: studentOf, access, classTeacherOf } = await authenticate(authorization);

		const node = client.db(`RBMI`).collection(`attendence`);

		if (access !== `Student` && !className && !classTeacherOf)
			throw new UserInputError(`Insufficient data ⚠`, { error: `You must provide Class info. to get details of.` });

		const check = await node.findOne({ class: className });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the class you've provided details for.`,
			});

		return await node
			.aggregate([
				{
					$match: {
						class: studentOf || className || classTeacherOf,
						"idx.month": month || new Date().getMonth(),
						"idx.year": year || new Date().getFullYear(),
					},
				},
				{
					$addFields: {
						students: { $toObjectId: `$students` },
						createdBy: { $toObjectId: `$createdBy` },
					},
				},
				{
					$lookup: {
						from: `students`,
						localField: `students`,
						foreignField: `_id`,
						as: `students`,
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
				{ $unwind: `$createdBy` },
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

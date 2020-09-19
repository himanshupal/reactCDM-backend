const { UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { class: className, month, year }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { class: studentOf, access, classTeacherOf } = await authenticate(authorization);

		const node = client.db(dbName).collection(`attendence`);

		if (access !== `Student` && !className && !classTeacherOf)
			throw new UserInputError(`Insufficient data ⚠`, { error: `You must provide Class info. to get details of.` });

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
						updatedBy: { $toObjectId: `$updatedBy` },
						students: { $map: { input: `$students`, as: `student`, in: { $toObjectId: `$$student` } } },
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
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

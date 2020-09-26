const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

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

		const { access, classTeacherOf, class: userClass } = await authenticate(authorization);

		if (access !== `Student` && !className && !classTeacherOf)
			throw new UserInputError(`Insufficient data ⚠`, {
				error: `You must provide a class info to get students details.`,
			});

		if (className) {
			const check = await client
				.db(dbName)
				.collection(`classes`)
				.findOne({ _id: ObjectId(className) });
			if (!check)
				throw new UserInputError(`Not Found ⚠`, {
					error: `Couldn't find the class you've provided details for.`,
				});
		}

		return await client
			.db(dbName)
			.collection(`students`)
			.aggregate([
				{
					$match: {
						class: userClass || className || classTeacherOf,
					},
				},
				{
					$addFields: {
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
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
				{
					$unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true },
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{
					$unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true },
				},
			])
			.sort({ "name.first": 1 })
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

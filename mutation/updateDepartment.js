const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggenInUser, access } = await authenticate(authorization);
		if (access !== `Director`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`departments`);

		if (data.name) {
			const check = await node.findOne({ name: data.name });
			if (check)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a department with same name.`,
				});
		}

		if (data.director) {
			const check = await node.findOne({ director: data.director });
			if (check)
				throw new UserInputError(`Teacher reallocation ⚠`, {
					error: `The teacher is already assigned as Director to another department.`,
				});
		}

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					...data,
					updatedAt: Timestamp.fromNumber(Date.now()),
					updatedBy: loggenInUser,
				},
			},
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error updating department. Please try again or contact admin if issue persists.`,
			});

		const [department] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						director: { $toObjectId: `$director` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `director`,
						foreignField: `_id`,
						as: `director`,
					},
				},
				{ $unwind: `$director` },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: `$createdBy` },
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{ $unwind: `$updatedBy` },
			])
			.toArray();

		return department;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

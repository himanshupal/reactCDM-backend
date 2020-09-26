const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const { clearObject } = require(`clear-object`);
const { flatten } = require(`flat`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		clearObject(data);
		data = flatten(data);

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`teachers`);

		if (_id !== loggedInUser && (access === `Associate Professor` || access === `Professor`))
			throw new UserInputError(`Not Allowed ⚠`, {
				error: `You do not have enough permission to change other teacher's details.`,
			});

		if (data.username) {
			const student = await client.db(dbName).collection(`students`).findOne({ username: data.username });
			if (student)
				throw new UserInputError(`Username not available ⚠`, {
					error: `${data.username} is already assigned to a student. Please choose another username.`,
				});

			const teacher = await node.findOne({ username: data.username });
			if (teacher)
				throw new UserInputError(`Username not available ⚠`, {
					error: `${data.username} is already assigned to another teacher. Please choose another username.`,
				});
		}

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					...data,
					updatedAt: Timestamp.fromNumber(Date.now()),
					updatedBy: loggedInUser,
				},
			},
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error updating profile. Please try again or contact admin if issue persists.`,
			});

		const [updated] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						department: { $toObjectId: `$department` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `departments`,
						localField: `department`,
						foreignField: `_id`,
						as: `department`,
					},
				},
				{ $unwind: { path: `$department`, preserveNullAndEmptyArrays: true } },
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

		return updated;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

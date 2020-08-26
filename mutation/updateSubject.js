const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access))
			throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`subjects`);

		if (data.subjectCode || data.uniSubjectCode) {
			const check = await node.findOne({
				$or: [
					{ subjectCode: data.subjectCode },
					{ uniSubjectCode: data.uniSubjectCode },
				],
			});
			if (check)
				throw new UserInputError(`Already exists ⚠`, {
					error: `Subject ${check.name} already exists for provided subject codes.`,
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
				error: `Error updating course. Please try again or contact admin if issue persists.`,
			});

		const [subject] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						teacher: { $toObjectId: `$teacher` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `teacher`,
						foreignField: `_id`,
						as: `teacher`,
					},
				},
				{
					$unwind: {
						path: `$teacher`,
						preserveNullAndEmptyArrays: true,
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

		return subject;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

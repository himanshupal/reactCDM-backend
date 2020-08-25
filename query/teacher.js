const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { username }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { username: loggedInUser, access } = await authenticate(
			authorization
		);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		if (
			username &&
			username !== loggedInUser &&
			(access === `Associate Professor` || access === `Assistant Professor`)
		)
			throw new UserInputError(`Not Allowed ⚠`, {
				error: `You do not have enough permission to view other teacher's specific details.`,
			});

		const [teacher] = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.aggregate([
				{ $match: { username: username || loggedInUser } },
				{
					$addFields: {
						_id: { $toString: `$_id` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `classes`,
						localField: `_id`,
						foreignField: `classTeacher`,
						as: `classTeacherOf`,
					},
				},
				{
					$unwind: {
						path: `$classTeacherOf`,
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `teacher`,
						as: `teaches`,
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
				{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return teacher;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { username }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();

		const { username: loggedInUser, access } = await authenticate(authorization);
		if (username && access === `Student` && username !== loggedInUser) throw new ForbiddenError(`Access Denied ⚠`);

		if (access !== `Student` && !username)
			throw new UserInputError(`Insufficient data ⚠`, {
				error: `You must provide a username to get student's details.`,
			});

		const [student] = await client
			.db(dbName)
			.collection(`students`)
			.aggregate([
				{
					$match: {
						username: access === `Student` ? loggedInUser : username,
					},
				},
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
						let: { class: { $toObjectId: `$class` } },
						pipeline: [
							{ $match: { $expr: { $eq: [`$_id`, `$$class`] } } },
							{
								$lookup: {
									from: `teachers`,
									let: { classTeacher: { $toObjectId: `$classTeacher` } },
									pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$classTeacher`] } } }],
									as: `classTeacher`,
								},
							},
							{ $unwind: { path: `$classTeacher`, preserveNullAndEmptyArrays: true } },
						],
						as: `class`,
					},
				},
				{ $unwind: `$class` },
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

		if (!student)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the student you've provided username for.`,
			});

		return student;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

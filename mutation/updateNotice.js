const { UserInputError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

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
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`notices`);

		if (data.scope) {
			if (![`Class`, `Course`, `Department`].includes(data.scope))
				throw new UserInputError(`Invalid Argument ⚠`, {
					error: `Notices can be provided only for class, course or for a department.`,
				});

			if (!data.scopeId)
				throw new UserInputError(`Argument Missing ⚠`, {
					error: `You must provide info of ${data.scope.toLowerCase()} to add notice for.`,
				});

			const check = await client
				.db(`RBMI`)
				.collection(data.scope === `Class` ? `classes` : data.scope === `Course` ? `courses` : `departments`)
				.findOne({ _id: ObjectId(data.scopeId) });
			if (!check)
				throw new UserInputError(`${data.scope} Not Found ⚠`, {
					error: `Couldn't find any ${
						data.scope === `Class` ? `class` : data.scope === `Course` ? `course` : `department`
					} with provided details.`,
				});
		}

		const exist = await node.findOne({ _id: ObjectId(_id) });
		if (exist && exist.createdBy !== loggedInUser)
			throw new UserInputError(`Access Denied ⚠`, {
				error: `You can only edit notices created by you.`,
			});

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
				error: `Error updating note. Please try again or contact admin if issue persists.`,
			});

		const [saved] = await node
			.aggregate([
				{ $match: { _id: value._id } },
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

		return saved;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

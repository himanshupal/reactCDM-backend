const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

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

		const { _id: loggedInUser, access, class: userClass } = await authenticate(authorization);
		if (access !== `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`notes`);

		if (data.scope && ![`Class`, `Private`, `Friends`].includes(data.scope))
			throw new UserInputError(`Invalid Argument ⚠`, {
				error: `Notes can only be private or between friends or for a class.`,
			});

		const exist = await node.findOne({ _id: ObjectId(_id) });
		if (exist && exist.createdBy !== loggedInUser)
			throw new UserInputError(`Access Denied ⚠`, {
				error: `You can only edit notes created by you.`,
			});

		const toSave = data.scope === `Class` ? { ...data, class: userClass } : { ...data, class: null };

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					...toSave,
					edited: true,
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
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return saved;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

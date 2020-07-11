const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectID, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		user = CheckAuth(authorization);
		if (!accessAllowed.includes(user.access))
			throw new ForbiddenError(`Access Denied !`);
		const check = await client
			.db(`RBMI`)
			.collection(`subjects`)
			.findOne({ _id: ObjectId(id) });
		if (!check)
			throw new UserInputError(
				`Not found !`,
				`Couldn't find any subject with given details`
			);
		const res = await client
			.db(`RBMI`)
			.collection(`subjects`)
			.updateOne(
				{
					_id: ObjectId(id),
				},
				{
					$set: {
						...data,
						lastUpdated: Date.now(),
						lastUpdatedBy: user.username,
					},
				}
			);
		return res.modifiedCount > 0
			? `Subject updated !`
			: `Error saving data. Please try again or contact admin if issue persists`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

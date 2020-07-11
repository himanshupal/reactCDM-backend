const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = authenticate(authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access Denied !`);
		const check = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ _id: ObjectId(id) });
		if (!check)
			throw new UserInputError(
				`Not found !`,
				`Couldn't find any student with given details`
			);
		const res = await client
			.db(`RBMI`)
			.collection(`students`)
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
			? `Record updated !`
			: `Error saving data. Please try again or contact admin if issue persists`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

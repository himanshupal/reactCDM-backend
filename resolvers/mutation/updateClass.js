const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
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
		const user = await authenticate(authorization);
		if (accessAllowed.includes(user.access))
			throw new ForbiddenError(`Access Denied !`);
		const check = await client
			.db(`RBMI`)
			.collection(`classes`)
			.findOne({
				_id: ObjectId(id),
			});
		if (!check)
			throw new UserInputError(
				`Not found !`,
				`Couldn't find any class with given details`
			);
		const alias = `${data.class || check.class}, Year ${
			data.year || check.year
		} Sem ${data.semester || check.semester}`;
		const res = await client
			.db(`RBMI`)
			.collection(`classes`)
			.updateOne(
				{
					_id: ObjectId(id),
				},
				{
					$set: {
						...data,
						alias,
						lastUpdated: Date.now(),
						lastUpdatedBy: user.username,
					},
				}
			);
		return res.modifiedCount > 0
			? `Class updated !`
			: `Error saving data. Please try again or contact admin if issue persists`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

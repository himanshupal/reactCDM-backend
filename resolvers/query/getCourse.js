const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { department }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access denied !`);
		if (department)
			return await client
				.db(`RBMI`)
				.collection(`courses`)
				.find({ department })
				.toArray();
		return await client.db(`RBMI`).collection(`courses`).find().toArray();
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

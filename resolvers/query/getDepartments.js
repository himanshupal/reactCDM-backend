const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, __, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = authenticate(authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access Denied !`);
		return await connection
			.db(`RBMI`)
			.collection(`departments`)
			.find()
			.toArray();
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

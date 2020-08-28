const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { page }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		await authenticate(authorization);

		return await client
			.db(`RBMI`)
			.collection(`notices`)
			.aggregate([])
			.skip(5 * (page - 1))
			.limit(5)
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

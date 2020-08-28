const { MongoClient, ObjectId } = require(`mongodb`);

module.exports = async (_, { _id }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const [notice] = await client
			.db(`RBMI`)
			.collection(`notices`)
			.aggregate([{ $match: { _id: ObjectId(_id) } }])
			.toArray();

		return notice;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

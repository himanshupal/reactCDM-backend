const { MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { id }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		if (!authorization)
			return await client
				.db(`RBMI`)
				.collection(`gists`)
				.find({ scope: `public` })
				.toArray();
		if (id)
			return await client
				.db(`RBMI`)
				.collection(`gists`)
				.find({ _id: ObjectId(id) })
				.toArray();
		const user = authenticate(authorization);
		return await client
			.db(`RBMI`)
			.collection(`gists`)
			.find({
				$or: [
					{
						createdBy: user.username,
						scope: `private`,
					},
					{
						scope: `public`,
					},
				],
			})
			.toArray();
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

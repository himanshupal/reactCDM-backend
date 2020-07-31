const { MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { gid }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`gists`);
		if (gid) return await node.find({ _id: ObjectId(gid) }).toArray();
		if (!authorization) return await node.find({ scope: `Public` }).toArray();
		return await node
			.find({
				$or: [
					{
						createdBy: user.username,
						scope: `Private`,
					},
					{
						scope: `Public`,
					},
				],
			})
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

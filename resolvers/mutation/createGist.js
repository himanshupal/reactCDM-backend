const { UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { data }, { headers }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(headers.authorization);
		if (user.access === `student` && data.scope === `public`)
			throw new UserInputError(
				`Access Denied !`,
				`Students are not allowed to create public gists`
			);
		const res = await client
			.db(`RBMI`)
			.collection(`gists`)
			.insertOne({ ...data, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0
			? `Saved successfully`
			: `There was some error saving data, please try again or contact admin ! `;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

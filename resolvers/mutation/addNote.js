const { UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, { data }, { headers }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(headers.authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (user.access === `Student` && data.scope === `Public`)
			throw new UserInputError(`Access Denied ⚠`, { error: `Students are not allowed to create public gists.` });
		const res = await client
			.db(`RBMI`)
			.collection(`gists`)
			.insertOne({ ...data, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0 ? `Gist created successfully ✔` : `There was some error saving data. Please try again or contact admin.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (!scope) throw new UserInputError(`Argument Missing ⚠`, { error: `You must select a scope for notice.` });
		if (data.scope === `Department` && (user.access === `Associate Professor` || user.access === `Assistant Professor`))
			throw new UserInputError(`Not enough access ⚠`, { error: `Professor(s) can't create department wide notices.` });
		else if (data.scope === `Course` && user.access === `Assistant Professor`)
			throw new UserInputError(`Not enough access ⚠`, { error: `Assistant Professor(s) can't create course wide notices.` });
		const res = await client
			.db(`RBMI`)
			.collection(`notices`)
			.insertOne({ ...data, [data.scope]: data.scopeId, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0 ? `Added successfully ✔` : `There was some error saving data. Please try again or contact admin.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

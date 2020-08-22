const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, { data: { subject, description, scope, scopeId } }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (![`Class`, `Private`, `Friends`].includes(scope || `Private`))
			throw new UserInputError(`Access Denied ⚠`, { error: `Notes can only be private or between friends or for a class.` });
		if (scope === `Class` && !scopeId)
			throw new UserInputError(`Argument Missing ⚠`, { error: `You must provide a class as scopeId to add a class wide note.` });
		const res = await client
			.db(`RBMI`)
			.collection(`notes`)
			.insertOne({ subject, description, [scope || `Private`]: scopeId ? scopeId : true, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0 ? `Added successfully ✔` : `There was some error saving  Please try again or contact admin.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

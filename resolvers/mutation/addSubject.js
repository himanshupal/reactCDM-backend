const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access))
			throw new ForbiddenError(`Access Denied !`);
		const check = await client
			.db(`RBMI`)
			.collection(`subjects`)
			.findOne({ subjectCode: data.subjectCode });
		if (check)
			throw new UserInputError(`Already exists...`, {
				error: `Subject ${res.name} with code ${res.subjectCode} already exists !`,
			});
		const res = await client
			.db(`RBMI`)
			.collection(`subjects`)
			.insertOne({
				...data,
				createdAt: Date.now(),
				createdBy: user.username,
			});
		return res.insertedCount > 0
			? `Subject ${data.subjectCode} saved successfully`
			: `There was some error saving data, please try again or contact admin if issue persists`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

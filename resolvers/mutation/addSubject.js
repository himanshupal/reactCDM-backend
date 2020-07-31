const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`subjects`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const check = await node.findOne({ subjectCode: data.subjectCode });
		if (check)
			throw new UserInputError(`Already exists ⚠`, {
				error: `Subject ${check.name} with code ${data.subjectCode} already exists.`,
			});
		const classCheck = await client.db(`RBMI`).collection(`classes`).findOne({ name: data.class });
		if (!classCheck)
			throw new UserInputError(`Class not found ⚠`, {
				error: `Couldn't find ${data.class} class with given details.`,
			});
		const res = await node.insertOne({
			...data,
			createdAt: Date.now(),
			createdBy: user.username,
		});
		return res.insertedCount > 0
			? `Subject ${data.subjectCode} saved successfully ✔`
			: `There was some error saving subject. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

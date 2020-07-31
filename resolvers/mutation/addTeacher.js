const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Head of Department`, `Director`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`teachers`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const checkStudent = await client.db(`RBMI`).collection(`students`).findOne({ username: data.username });
		const checkTeacher = await node.findOne({ username: data.username });
		if (checkStudent || checkTeacher)
			throw new UserInputError(`Already exists ⚠`, {
				error: `${data.username} is already assigned to someone. Please choose another username`,
			});
		const res = await node.insertOne({ ...data, password: data.username, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0
			? `${data.name.first} ${data.name.last} successfully added to teachers ✔`
			: `There was some error saving data. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

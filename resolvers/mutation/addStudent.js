const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ generatePassword } = require(`../../argon`),
	{ MongoClient } = require(`mongodb`),
	{ blake2bHex } = require(`blakejs`);

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
		const node = client.db(`RBMI`).collection(`students`);
		const password = await generatePassword(blake2bHex(data.username));
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const checkTeacher = await client.db(`RBMI`).collection(`teachers`).findOne({ username: data.username });
		const checkStudent = await node.findOne({ username: data.username });
		if (checkTeacher || checkStudent)
			throw new UserInputError(`Already exists ⚠`, {
				error: `${data.username} is already assigned to someone. Please choose another username !`,
			});
		const res = await node.insertOne({ ...data, password, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0
			? `${data.username} is successfully added to students ✔`
			: `There was some error saving data. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

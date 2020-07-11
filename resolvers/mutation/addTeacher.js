const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Head of Department`, `Director`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		client = await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access))
			throw new Forbidden(`Access Denied !`);
		const checkStudent = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ username: data.username });
		const checkTeacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.findOne({ username: data.username });
		if (checkStudent || checkTeacher)
			throw new Error(
				`Already exists...`,
				`${res.username} is already assigned to someone. Please choose another username !`
			);
		const res = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.insertOne({ ...data, createdAt: Date.now(), createdBy: user.username });
		return res.insertedCount > 0
			? `${data.username} added successfully`
			: `There was some error saving data, please try again or contact admin if issue persists`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

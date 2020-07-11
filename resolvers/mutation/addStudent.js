const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = authenticate(authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access Denied !`);
		const checkTeacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.findOne({ username: data.username });
		const checkStudent = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ username: data.username });
		if (checkTeacher || checkStudent)
			throw new UserInputError(
				`Already exists`,
				`${res.username} is already assigned to someone. Please choose another username !`
			);
		const res = await client
			.db(`RBMI`)
			.collection(`students`)
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

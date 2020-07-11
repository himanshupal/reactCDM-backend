const { UserInputError, ForbiddenError } = require(`apollo-server`),
	authenticate = require(`../../checkAuth`),
	{ MongoClient } = require(`mongodb`),
	accessAllowed = [
		`Head of Department`,
		`Assosiate Professor`,
		`Assistant Professor`,
	];

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
		if (data.holiday && data.students)
			throw new UserInputError(`It's holiday`, {
				error: `Cannot add students on holiday`,
			});
		const check = await client
			.db(`RBMI`)
			.collection(`attendence`)
			.findOne({ day: data.day, class: data.class });
		if (check)
			throw new UserInputError(`Already exists !`, {
				error: `Attendence already taken by ${res.createdBy} at ${new Date(
					res.createdAt
				)
					.toLocaleTimeString("en-in", {
						weekday: "short",
						year: "numeric",
						month: "long",
						day: "numeric",
					})
					.replace(/,/g, ``)}`,
			});
		const res = await client
			.db(`RBMI`)
			.collection(`attendence`)
			.insertOne({
				...data,
				totalStudents: data.students ? data.students.length : 0,
				createdAt: Date.now(),
				createdBy: user.username,
			});
		return res.insertedCount > 0
			? `Attendence saved successfully`
			: `There was some error saving data, please try again or contact admin !`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

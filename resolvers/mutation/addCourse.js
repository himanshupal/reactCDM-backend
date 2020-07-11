const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = authenticate(authorization);
		if (!accessAllowed.includes(user.access))
			throw new ForbiddenError(`Access Denied !`);
		const check = await client
			.db(`RBMI`)
			.collection(`courses`)
			.findOne({ name: data.name });
		if (check)
			throw new Error(
				`Already exists`,
				`${res.name} course already exists under ${res.department} department !`
			);
		const dptCheck = await client
			.db(`RBMI`)
			.collection(`departments`)
			.findOne({ name: data.department });
		if (!dptCheck) {
			const dptAdd = await client
				.db(`RBMI`)
				.collection(`departments`)
				.insertOne({
					name: data.department,
					director: data.director,
					createdAt: Date.now(),
					createdBy: user.username,
				});
			if (!dptAdd.insertedCount > 0)
				throw new UserInputError(
					`Error !`,
					`Couldn't add ${department} to database. Please try again or contact admin if issue persists`
				);
		}
		const res = await client
			.db(`RBMI`)
			.collection(`courses`)
			.insertOne({
				...data,
				createdAt: Date.now(),
				createdBy: user.username,
			});
		return res.insertedCount > 0
			? `${data.name} course added successfully.`
			: `There was some error saving data, please try again or contact admin !`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

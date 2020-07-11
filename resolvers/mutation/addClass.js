const { ForbiddenError, UserInputError } = require(`apollo-server`),
	authenticate = require(`../../checkAuth`),
	{ MongoClient } = require(`mongodb`),
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
		const check = await client.db(`RBMI`).collection(`classes`).findOne({
			class: data.class,
			year: data.year,
			batch: data.batch,
			semester: data.semester,
		});
		if (check)
			throw new UserInputError(`Already exists...`, {
				error: `${data.class}, Year ${data.year} Sem ${data.semester} already exists for ${data.batch} !`,
			});
		const res = await client
			.db(`RBMI`)
			.collection(`classes`)
			.insertOne({
				...data,
				alias: `${data.class}, Year ${data.year} Sem ${data.semester}`,
				createdAt: Date.now(),
				createdBy: user.username,
			});
		return res.insertedCount > 0
			? `${data.class}, Sem ${data.semester} added to classes`
			: `There was some error saving data, please try again or contact admin !`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

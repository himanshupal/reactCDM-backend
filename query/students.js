const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { class: className }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();

		const { access, classTeacherOf } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		if (!className && !classTeacherOf)
			throw new UserInputError(`Insufficient data ⚠`, {
				error: `You must provide a class info to get students details.`,
			});

		return await client
			.db(`RBMI`)
			.collection(`students`)
			.find({ class: className || classTeacherOf })
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

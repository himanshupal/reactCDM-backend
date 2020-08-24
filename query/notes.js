const { MongoClient } = require(`mongodb`),
	authenticate = require(`../checkAuth`);

const accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, __, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		return await client
			.db(`RBMI`)
			.collection(`notes`)
			.find({
				$or: [
					{
						createdBy: user.username,
						Private: true,
					},
					{
						[scope]: scopeId,
					},
				],
			})
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

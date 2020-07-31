const { ForbiddenError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { tid, data }, { authorization }) => {
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
		const res = await node.updateOne(
			{
				_id: ObjectId(tid),
			},
			{
				$set: {
					...data,
					updatedAt: Date.now(),
					updatedBy: user.username,
				},
			}
		);
		return res.modifiedCount > 0 ? `Record updated successfully ✔` : `Error saving data. Please try again or contact admin if issue persists.`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

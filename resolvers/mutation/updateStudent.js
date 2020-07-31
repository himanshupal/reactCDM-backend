const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, { sid, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`students`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const check = await node.findOne({ _id: ObjectId(sid) });
		if (!check) throw new UserInputError(`Not found ⚠`, { error: `Couldn't find any student with given details.` });
		const res = await node.updateOne(
			{
				_id: ObjectId(sid),
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

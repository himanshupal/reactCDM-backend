const { UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, { gid, data }, { headers }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(headers.authorization);
		const node = client.db(`RBMI`).collection(`gists`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (user.access === `Student` && data.scope === `Public`)
			throw new UserInputError(`Access Denied ⚠`, { error: `Students are not allowed to create public gists.` });
		const check = node.findOne({ _id: ObjectId(gid) });
		if (check && check.scope === `Private` && check.createdBy !== user.username)
			throw new UserInputError(`Private Gist ⚠`, { error: `You cannot edit private gist unless created by you.` });
		const res = await node.updateOne({ _id: ObjectId(gid) }, { $set: { ...data, updatedAt: Date.now(), updatedBy: user.username } });
		return res.modifiedCount > 0 ? `Gist updated successfully ✔` : `There was some error saving data. Please try again or contact admin.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

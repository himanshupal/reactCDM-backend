const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, { cid, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`classes`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const existenceCheck = await node.findOne({ _id: ObjectId(cid) });
		if (!existenceCheck) throw new UserInputError(`Not found ⚠`, { error: `Couldn't find any class with given details.` });
		if (data.newName) throw new UserInputError(`Error in data provided ⚠`, { error: `Use \`name\` instead of \`newName\` to update name of Class.` });
		if (data.name) {
			const nameCheck = await node.findOne({ name: data.name });
			if (nameCheck) throw new UserInputError(`Already exists ⚠`, { error: `There is already a class with same name.` });
		}
		const res = await node.updateOne({ _id: ObjectId(cid) }, { $set: { ...data, lastUpdated: Date.now(), lastUpdatedBy: user.username } });
		return res.modifiedCount > 0
			? `Class updated successfully ✔`
			: `There was some error updating class. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

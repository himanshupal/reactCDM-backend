const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { sid, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const node = client.db(`RBMI`).collection(`subjects`);
		const check = await node.findOne({ _id: ObjectId(sid) });
		if (!check) throw new UserInputError(`Not found ⚠`, { error: `Couldn't find any subject with given details.` });
		if (data.subjectCode || data.uniSubjectCode) {
			const codeCheck = await node.findOne({ $or: [{ subjectCode: data.subjectCode }, { uniSubjectCode: data.uniSubjectCode }] });
			if (codeCheck)
				throw new UserInputError(`Already exists ⚠`, {
					error: `Subject ${codeCheck.name} already exists for provided subject codes.`,
				});
		}
		if (data.class) {
			const classCheck = await client.db(`RBMI`).collection(`classes`).findOne({ name: data.class });
			if (!classCheck)
				throw new UserInputError(`Class not found ⚠`, {
					error: `Couldn't find ${data.class} class with given details.`,
				});
		}
		const res = await node.updateOne(
			{ _id: ObjectId(sid) },
			{
				$set: {
					...data,
					updatedAt: Date.now(),
					updatedBy: user.username,
				},
			}
		);
		return res.modifiedCount > 0
			? `Subject updated successfully ✔`
			: `There was some error saving subject. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

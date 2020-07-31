const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { cid, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const node = client.db(`RBMI`).collection(`courses`);
		const check = await node.findOne({ _id: ObjectId(cid) });
		if (!check)
			throw new UserInputError(`Not found ⚠`, {
				error: `${check.name} course doesn't exists under any departments.`,
			});
		if (data.name) {
			const nameCheck = await node.findOne({ name: data.name });
			if (nameCheck) throw new UserInputError(`Already exists ⚠`, { error: `There is already a course with same name.` });
		}
		const res = await node.updateOne(
			{ _id: ObjectId(cid) },
			{
				$set: {
					...data,
					updatedAt: Date.now(),
					updatedBy: user.username,
				},
			}
		);
		return res.modifiedCount > 0
			? `Course updated successfully ✔`
			: `There was some error updating course. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

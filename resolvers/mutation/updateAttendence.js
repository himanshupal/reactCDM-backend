const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Assosiate Professor`, `Assistant Professor`];

module.exports = async (_, { aid, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`attendence`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (data.holiday && data.students)
			throw new UserInputError(`It's holiday ⚠`, {
				error: `Cannot add students on holiday.`,
			});
		const check = await node.findOne({ _id: ObjectId(aid) });
		if (!check) throw new UserInputError(`Not found ⚠`, { error: `Couldn't find attendence data you are trying to update` });
		if (data.holiday) data.students = null;
		if (data.students) data.holiday = null;
		const res = await node.updateOne(
			{
				_id: ObjectId(aid),
			},
			{
				$set: {
					...data,
					totalStudents: data.students ? data.students.length : 0,
					updatedAt: Date.now(),
					updatedBy: user.username,
				},
			}
		);
		return res.modifiedCount > 0
			? `Attendence updated successfully ✔`
			: `There was some error saving data. Please try again or contact admin if issue persists.`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

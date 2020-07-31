const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`courses`);
		const dptNode = client.db(`RBMI`).collection(`departments`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const check = await node.findOne({ identifier: data.identifier });
		if (check)
			throw new UserInputError(`Already exists ⚠`, {
				error: `${data.identifier} abbreviation is already being used for ${check.name} course.`,
			});
		const dptCheck = await dptNode.findOne({ name: data.department });
		let dptAdd;
		if (!dptCheck) {
			dptAdd = await dptNode.insertOne({
				name: data.department,
				director: data.director,
				headOfDepartment: data.headOfDepartment,
				createdAt: Date.now(),
				createdBy: user.username,
			});
			if (!dptAdd.insertedCount > 0)
				throw new UserInputError(`Error adding department ⚠`, {
					error: `Couldn't add ${data.department} department to database. Please try again or contact admin if issue persists.`,
				});
		}
		delete data.director;
		delete data.headOfDepartment;
		const res = await node.insertOne({
			...data,
			department: dptCheck ? dptCheck._id.toString() : dptAdd.insertedId.toString(),
			createdAt: Date.now(),
			createdBy: user.username,
		});
		return res.insertedCount > 0
			? `Course added successfully ✔`
			: `There was some error saving data. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

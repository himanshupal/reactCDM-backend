const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Assosiate Professor`, `Assistant Professor`];

module.exports = async (_, { data }, { authorization }) => {
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
		const check = await node.findOne({ day: data.day, class: data.class });
		if (check)
			throw new UserInputError(`Already saved ⚠`, {
				error: `Attendence already taken by ${check.createdBy} at ${new Date(check.createdAt)
					.toLocaleTimeString("en-in", {
						weekday: "short",
						year: "numeric",
						month: "long",
						day: "numeric",
					})
					.replace(/,/g, ``)}. You can edit it though.`,
			});
		const res = await node.insertOne({
			...data,
			idx: { date: Number(data.day.split(`-`)[2]), month: Number(data.day.split(`-`)[1]) - 1, year: Number(data.day.split(`-`)[0]) },
			totalStudents: data.students ? data.students.length : 0,
			createdAt: Date.now(),
			createdBy: user.username,
		});
		return res.insertedCount > 0 ? `Attendence saved successfully ✔` : `There was some error saving data. Please try again or contact admin.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

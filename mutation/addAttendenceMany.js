const { ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Assosiate Professor`, `Assistant Professor`];

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
		const res = await Promise.all(
			data.map(async (date) => {
				try {
					if (date.day !== undefined)
						return await client
							.db(`RBMI`)
							.collection(`attendence`)
							.updateOne(
								{
									day: date.day,
								},
								{
									$set: {
										class: cid,
										holiday: date.holiday,
										students: date.students,
										idx: { date: Number(date.day.split(`-`)[2]), month: Number(date.day.split(`-`)[1]) - 1, year: Number(date.day.split(`-`)[0]) },
										totalStudents: date.students ? date.students.length : 0,
										createdAt: Date.now(),
										createdBy: user.username,
									},
								},
								{
									upsert: true,
								}
							);
				} catch (error) {
					throw error;
				}
			})
		);
		return res.length > 0 ? `Attendence saved successfully ✔` : `There was some error saving data, please try again or contact admin !`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};

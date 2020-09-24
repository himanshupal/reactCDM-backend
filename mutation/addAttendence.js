const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { class: className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access, classTeacherOf } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		if (!className && !classTeacherOf)
			throw new UserInputError(`Insufficient data ⚠`, { error: `You must provide Class info. to save attendence to.` });

		const node = client.db(dbName).collection(`attendence`);

		const day = new Date().toLocaleDateString();

		const check = await node.findOne({ day, class: className || classTeacherOf });
		if (check)
			throw new UserInputError(`Already saved ⚠`, {
				error: `Attendence already taken at ${new Date(Number(check.updatedAt)).toDateString()} ${new Date(
					Number(check.updatedAt)
				).toLocaleTimeString()}`,
			});

		const [date, month, year] = day.split(/\//);

		const { insertedCount } = await node.insertOne({
			...data,
			day,
			class: className || classTeacherOf,
			idx: { date: Number(date), month: Number(month) - 1, year: Number(year) },
			totalStudents: data.students ? data.students.length : 0,
			updatedAt: Timestamp.fromNumber(Date.now()),
			updatedBy: loggedInUser,
		});

		return insertedCount > 0 ? `Attendence Saved` : `Server Side Error !`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};

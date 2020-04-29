const { client, Error } = require(`../../index`);

exports.getClass = async (_, { _id, department }) => {
	if (!_id && !department) {
		throw new Error(`Arguments missing...`, {
			error: `You must provide either an _id for class or department for all classes within department...`,
		});
	}
	try {
		if (_id) {
			const res = await (await client)
				.db(`RBMI`)
				.collection(`classes`)
				.aggregate([
					{
						$match: {
							_id,
						},
					},
					{
						$lookup: {
							from: `students`,
							localField: `_id`,
							foreignField: `class`,
							as: `students`,
						},
					},
					{
						$lookup: {
							from: `attendence`,
							localField: `_id`,
							foreignField: `class`,
							as: `attendence`,
						},
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `_id`,
							foreignField: `class`,
							as: `subjects`,
						},
					},
				])
				.toArray();
			if (res.length === 0)
				throw new Error(`Not found...`, {
					error: `No class found matching given _id...`,
				});
			return res.map((el) => {
				return {
					...el,
					totalStudents: el.students.length,
					timeTable: el.subjects,
				};
			});
		}
		const res = await (await client)
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{
					$match: {
						department,
					},
				},
				{
					$lookup: {
						from: `students`,
						localField: `_id`,
						foreignField: `class`,
						as: `students`,
					},
				},
				{
					$lookup: {
						from: `attendence`,
						localField: `_id`,
						foreignField: `class`,
						as: `attendence`,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `class`,
						as: `subjects`,
					},
				},
			])
			.toArray();
		if (res.length === 0)
			throw new Error(`Not found...`, {
				error: `No departments found matching given term...`,
			});
		return res.map((el) => {
			return {
				...el,
				totalStudents: el.students.length,
				timeTable: el.subjects,
			};
		});
	} catch (error) {
		throw new Error(error);
	}
};

function isVMException(ex) {
	const expectedMsg = "VM Exception while processing transaction: revert";

	const msg = typeof ex === "string" ? ex : ex.message;

	return msg.indexOf(expectedMsg) != -1;
}

module.exports = {
    isVMException : isVMException
}
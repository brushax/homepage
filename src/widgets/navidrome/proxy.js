import { createHash, randomBytes } from "crypto";

import genericProxyHandler from "utils/proxy/handlers/generic";

function createSubsonicToken(password, salt) {
  return createHash("md5").update(`${password}${salt}`).digest("hex");
}

export default async function navidromeProxyHandler(req, res) {
  req.extraContext = {
    transformWidget: (widget) => {
      if (widget.token && widget.salt) {
        return widget;
      }

      if (!widget.password) {
        return widget;
      }

      const salt = randomBytes(8).toString("hex");

      return {
        ...widget,
        salt,
        token: createSubsonicToken(widget.password, salt),
      };
    },
  };

  return genericProxyHandler(req, res);
}

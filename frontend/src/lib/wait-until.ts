export const waitUntil = async (
  condition: () => boolean | Promise<boolean>,
  interval: number = 100
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (await condition()) {
      resolve();
    } else {
      const ival = setInterval(async () => {
        const result: any = condition();
        if (typeof result === "object" && result instanceof Promise) {
          if (await result) {
            resolve();
            clearInterval(ival);
          }
        } else {
          if (result) {
            clearInterval(ival);
          }
        }
      }, interval);
    }
  });
};

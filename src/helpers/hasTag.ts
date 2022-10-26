export const hasTag = (obj: any, tag: string) => {
  var eventRegex = new RegExp('(^|,)s*' + tag + 's*($|,)', 'i');
  return eventRegex.test(obj.tags);
};

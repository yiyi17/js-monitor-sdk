import { v4 as uuidv4 } from 'uuid';

export function setTrace(): string {
  const result = uuidv4().replace(/-/g, '');
  return result;
}

export default {};

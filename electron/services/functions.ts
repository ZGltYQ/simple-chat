import FunctionCall from "../models/FunctionCall";
import LIVR from 'livr';

LIVR.Validator.registerDefaultRules({
    json: () => {
        return (value) => {
            try {
                JSON.parse(value);

                return
            } catch (e) {
                return 'INVALID_JSON';
            }
        };
    },
    func: () => {
        return (value) => {
            try {
                const func = new Function('params', value);

                func();

                return
            } catch (e) {
                return 'INVALID_FUNC';
            }
        };
    },
    boolean : () => {
        return (value) => {
            if (typeof value !== 'boolean') {
                return 'NOT_BOOLEAN';
            }
        }
    }
});

const validator = new LIVR.Validator({
    name: ['required', 'string'],
    description: ['required', 'string'],
    active : ['boolean'],
    params: ['required', 'json'],
    handler: ['required', 'func']
});

export const createFunction = async (_: any, args: any) => {
  const validated = validator.validate(args);

  if (!validated) {
    return { errors: validator.getErrors()};
  }

  const response = await FunctionCall.create(validated);

  return response;
}

export const deleteFunction = async (_: any, id: number) => {
  const response = await FunctionCall.delete({id});
  
  return response
}

export const updateFunction = async (_: any, { id, ...args }: any) => {
    const validated = validator.validate(args);

    if (!validated) {
        return { errors: validator.getErrors()};
    }

    const response = await FunctionCall.update({ id }, args);
    
    return response
}

export const getFunctions = async () => {
  const result = await FunctionCall.findAll();
  
  return result;
}

export const getFunction = async (_: any, id: number) => {
  const result = await FunctionCall.findById(id);
  
  return result;
}

export const toggleFunction = async (_: any, id: number) => {
  const result = await FunctionCall.findById(id);

  const updated = await FunctionCall.update({ id }, { active: !result?.active });
  
  return updated;
}
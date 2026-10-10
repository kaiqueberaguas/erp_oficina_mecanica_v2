namespace WebApi.Exceptions;

public class LoginDuplicadoException() : Exception("Já existe um usuário cadastrado com este login.");
